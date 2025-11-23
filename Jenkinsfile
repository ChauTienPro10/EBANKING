pipeline {
    agent any

    tools {
        jdk 'java17'
        maven 'maven3'
    }

    stages {
        stage('Build Modules') {
            steps {
                script {
                    def modules = ['BACKEND/authService',
                     'BACKEND/userService',
                     'BACKEND/emailService',
                     'BACKEND/transactionService',
                     'BACKEND/firebaseService',
                     'BACKEND/chatbotService',
                     'BACKENND/ekycService',
                     'BACKEND/socket'
                    ]
                    for (module in modules) {
                        dir(module) {
                            def moduleBuild = load 'build.groovy'
                            moduleBuild.buildModule()
                        }
                    }
                }
            }
        }

        stage('Copy JAR to output') {
            steps {
                script {
                    sh 'mkdir -p output_jar_file'
                    def modules = ['authService',
                    'userService',
                    'emailService',
                    'transactionService',
                    'firebaseService',
                    'chatbotService',
                    'ekycService',
                    'socket']
                    for (module in modules) {
                        def srcPath = "BACKEND/${module}/target/*.jar"
                        def destPath = "output_jar_file/${module}.jar"
                        // Copy và rename file jar theo module
                        sh "cp ${srcPath} ${destPath}"
                        echo "Copied ${srcPath} to ${destPath}"
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Build & Test completed successfully!'
        }
        failure {
            echo 'Build failed!'
        }
    }
}
