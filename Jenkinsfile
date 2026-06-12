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

        stage('Load URLs') {
            steps {
                script {
                    def urlsFile = "${env.USERPROFILE}\\.pfe-urls.json"
                    if (fileExists(urlsFile)) {
                        def urls = readJSON file: urlsFile
                        env.PAGE_URL = urls.page_url
                        env.COLAB_API_URL = urls.api_url
                        echo "URLs loaded: PAGE_URL=${env.PAGE_URL}, API_URL=${env.COLAB_API_URL}"
                    } else {
                        error "Fichier ${urlsFile} introuvable. Lance d'abord config/update-urls.ps1"
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
            cleanWs()
        }
    }
}
