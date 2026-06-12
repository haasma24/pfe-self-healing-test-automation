pipeline {
    agent any

    environment {
        PAGE_URL = credentials('PAGE_URL')     // URL of the shop page (localhost.run)
        COLAB_API_URL = credentials('COLAB_API_URL') // URL of the Colab backend (ngrok)
        CONFIDENCE_THRESHOLD = '0.7'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
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
        failure {
            emailext(
                subject: "[FAILED] Pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline failed: ${env.BUILD_URL}",
                to: 'hammamiasma52@gmail.com'
            )
        }
        success {
            emailext(
                subject: "[SUCCESS] Pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline succeeded: ${env.BUILD_URL}",
                to: 'hammamiasma52@gmail.com'
            )
        }
    }
}
