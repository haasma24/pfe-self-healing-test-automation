pipeline {
    agent any

    environment {
        CONFIDENCE_THRESHOLD = '0.7'
        URLS_FILE = 'C:/ProgramData/.pfe-urls.json'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Load URLs') {
            steps {
                script {
                    // 1. Read tunnel URL from SSH log (always the latest, even after reconnect)
                    def tunnelLog = 'C:/ProgramData/pfe-tunnel.log'
                    def pageUrl = ''
                    if (fileExists(tunnelLog)) {
                        def logContent = readFile(file: tunnelLog, encoding: 'UTF-8')
                        def cleanLog = logContent.charAt(0) == '\uFEFF' ? logContent.substring(1) : logContent
                        // Match the LAST occurrence (in case SSH reconnected)
                        def matcher = cleanLog =~ /https:\/\/([a-z0-9.-]+)\.loca\.lt/
                        while (matcher.find()) {
                            pageUrl = matcher.group(0)
                        }
                        if (pageUrl) {
                            pageUrl += '/arcane-shop.html'
                        }
                    }
                    if (!pageUrl) {
                        error "Tunnel URL not found in ${tunnelLog}. Run start.ps1 first."
                    }
                    env.PAGE_URL = pageUrl
                    echo "PAGE_URL=${env.PAGE_URL}"

                    // 2. Read API URL from shared config (stable, preserved across restarts)
                    if (fileExists(env.URLS_FILE)) {
                        def content = readFile(file: env.URLS_FILE, encoding: 'UTF-8')
                        def cleanContent = content.charAt(0) == '\uFEFF' ? content.substring(1) : content
                        def urls = new groovy.json.JsonSlurper().parseText(cleanContent)
                        env.COLAB_API_URL = urls.api_url ?: ''
                    }
                    if (!env.COLAB_API_URL) {
                        error "API URL not found in ${env.URLS_FILE}. Run start.ps1 first."
                    }
                    echo "COLAB_API_URL=${env.COLAB_API_URL}"
                }
            }
        }

        stage('Update Test URLs') {
            steps {
                dir('test-runner') {
                    powershell """
                        @"
        COLAB_API_URL=${env.COLAB_API_URL}
        PAGE_URL=${env.PAGE_URL}
        CONFIDENCE_THRESHOLD=${env.CONFIDENCE_THRESHOLD}
"@ | Set-Content .env.healing -Encoding UTF8
                    """
                }
            }
        }

        stage('Verify Colab API') {
            steps {
                script {
                    def api = env.COLAB_API_URL
                    def retries = 10
                    def ok = false
                    for (def i = 0; i < retries; i++) {
                        try {
                            def result = powershell returnStdout: true, script: """
                                try {
                                    \$r = Invoke-WebRequest -Uri '${api}/ping' -UseBasicParsing -TimeoutSec 5
                                    \$r.StatusCode
                                } catch { 'FAIL' }
                            """
                            if (result.trim() == '200') {
                                echo "Colab API OK (HTTP 200)"
                                ok = true
                                break
                            } else {
                                echo "Waiting for Colab API... attempt ${i+1}/${retries} (got: ${result.trim()})"
                                sleep 3
                            }
                        } catch (e) {
                            echo "Waiting for Colab API... attempt ${i+1}/${retries}"
                            sleep 3
                        }
                    }
                    if (!ok) {
                        error "Colab API not reachable at ${api}/ping"
                    }
                }
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Test Runner') {
                    steps {
                        dir('test-runner') {
                            bat 'npm ci'
                        }
                    }
                }
                stage('Dashboard') {
                    steps {
                        dir('dashboard') {
                            bat 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Build Dashboard') {
            steps {
                dir('dashboard') {
                    bat 'npx ng build --configuration production'
                }
            }
        }

        stage('Run Metrics') {
            environment {
                COLAB_API_URL = "${COLAB_API_URL}"
                PAGE_URL = "${PAGE_URL}"
                CONFIDENCE_THRESHOLD = "${CONFIDENCE_THRESHOLD}"
            }
            steps {
                dir('test-runner') {
                    bat 'node scripts/run-metrics.js'
                }
            }
        }

        stage('Archive & Publish Reports') {
            steps {
                dir('dashboard') {
                    powershell 'Compress-Archive -Path dist\\* -DestinationPath ..\\dashboard-build.zip -Force'
                }
                archiveArtifacts artifacts: '''
                    dashboard-build.zip,
                    test-runner/eval/reports/*.json
                ''', fingerprint: true
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
