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
                    if (fileExists(env.URLS_FILE)) {
                        def content = readFile(file: env.URLS_FILE, encoding: 'UTF-8')
                        def cleanContent = content.charAt(0) == '\uFEFF' ? content.substring(1) : content
                        def urls = new groovy.json.JsonSlurper().parseText(cleanContent)
                        env.PAGE_URL = urls.page_url
                        env.COLAB_API_URL = urls.api_url
                        echo "PAGE_URL=${env.PAGE_URL}"
                        echo "COLAB_API_URL=${env.COLAB_API_URL}"
                    } else {
                        error "${env.URLS_FILE} not found. Run config/start-infra.ps1 before pipeline."
                    }
                }
            }
        }

        stage('Update Test URLs') {
            steps {
                dir('test-runner') {
                    powershell """
                        \$urls = Get-Content '${env.URLS_FILE}' -Raw | ConvertFrom-Json
                        @"
        COLAB_API_URL=\$(\$urls.api_url)
        PAGE_URL=\$(\$urls.page_url)/arcane-shop.html
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

        stage('Install Playwright Browsers') {
            steps {
                dir('test-runner') {
                    bat 'npx playwright install chromium'
                }
            }
        }

        stage('Run Playwright Tests') {
            environment {
                COLAB_API_URL = "${COLAB_API_URL}"
                PAGE_URL = "${PAGE_URL}"
                CONFIDENCE_THRESHOLD = "${CONFIDENCE_THRESHOLD}"
            }
            steps {
                dir('test-runner') {
                    bat 'npx playwright test --reporter=html,json,junit'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'test-runner/test-results/**/*.xml'
                }
            }
        }

        stage('Run ML Evaluation') {
            environment {
                COLAB_API_URL = "${COLAB_API_URL}"
                PAGE_URL = "${PAGE_URL}"
            }
            steps {
                dir('test-runner') {
                    bat 'node scripts/run-eval.js'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'test-runner/eval/reports/**/*.xml'
                }
            }
        }

        stage('Archive & Publish Reports') {
            steps {
                publishHTML(target: [
                    reportDir   : 'test-runner/playwright-report',
                    reportFiles : 'index.html',
                    reportName  : 'Playwright Test Report'
                ])
                dir('dashboard') {
                    bat 'tar -czf ../dashboard-build.tar.gz dist/'
                }
                archiveArtifacts artifacts: '''
                    dashboard-build.tar.gz,
                    test-runner/eval/reports/*.json,
                    test-runner/eval/reports/*.csv
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
