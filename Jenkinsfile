pipeline {
    agent any

    tools {
        jdk 'java17'        
        maven 'maven3'      
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'develop', url: 'https://github.com/ChauTienPro10/EBANKING'
            }
        }

        stage('Build BE - AuthService') {
            steps {
                sh 'cd ./BACKEND && ls'
            }
        }

        // stage('Build') {
        //     steps {
        //         sh 'mvn clean compile'
        //     }
        // }

        // stage('Test') {
        //     steps {
        //         sh 'mvn test'
        //     }
        // }

        // stage('Package') {
        //     steps {
        //         sh 'mvn package -DskipTests'
        //     }
        //     post {
        //         success {
        //             archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
        //         }
        //     }
        // }
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
