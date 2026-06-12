pipeline {
    agent any

    environment {
        CONFIDENCE_THRESHOLD = '0.7'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Start Infrastructure') {
            steps {
                script {
                    powershell returnStatus: true, script: '''
                        & "$env:WORKSPACE\\config\\start-infra.ps1"
                    '''
                    def urlsFile = "${env.ProgramData}\\.pfe-urls.json"
                    if (fileExists(urlsFile)) {
                        def urls = readJSON file: urlsFile
                        env.PAGE_URL = urls.page_url
                        env.COLAB_API_URL = urls.api_url
                        echo "PAGE_URL=${env.PAGE_URL}"
                        echo "COLAB_API_URL=${env.COLAB_API_URL}"
                    } else {
                        error "Failed to create ${urlsFile}"
                    }
                }
            }
        }

        stage('Verify Colab API') {
            steps {
                script {
                    def api = env.COLAB_API_URL
                    def retries = 10
                    def ok = false
                    for (i = 0; i < retries; i++) {
                        try {
                            sh "curl -s -o /dev/null -w '%{http_code}' '${api}/ping'"
                            echo "Colab API is reachable"
                            ok = true
                            break
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
                            sh 'npm ci'
                        }
                    }
                }
                stage('Dashboard') {
                    steps {
                        dir('dashboard') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Build Dashboard') {
            steps {
                dir('dashboard') {
                    sh 'npx ng build --configuration production'
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
                    sh 'npx playwright test --reporter=html,json'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'test-runner/test-results/**/*.xml'
                }
            }
        }

        stage('Archive Reports') {
            steps {
                publishHTML(target: [
                    reportDir   : 'test-runner/playwright-report',
                    reportFiles : 'index.html',
                    reportName  : 'Playwright Test Report'
                ])
                dir('dashboard') {
                    sh 'tar -czf ../dashboard-build.tar.gz dist/'
                }
                archiveArtifacts artifacts: 'dashboard-build.tar.gz', fingerprint: true
            }
        }
    }

    post {
        always {
            script {
                powershell returnStatus: true, script: '''
                    & "$env:WORKSPACE\\config\\stop-infra.ps1"
                '''
            }
            cleanWs()
        }
    }
}
