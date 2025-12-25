pipeline {
    agent any

    environment {
        // We read the EC2 IP from a Global Variable named 'EC2_INFRA_IP' which you will set in Jenkins
        REMOTE_HOST = "${env.EC2_INFRA_IP}" 
        REMOTE_USER = "ec2-user"
        REMOTE_DIR = "/usr/share/nginx/html"
        SSH_CREDENTIALS_ID = "ec2-ssh-key" // You must create this ID in Jenkins Credentials
    }

    // tools {
    //     nodejs 'NodeJS 18' 
    // }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                // Debug: Print node and npm versions to verify environment
                bat 'node -v'
                bat 'npm -v'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Deploy to EC2') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                     // 1. Clear old files
                     // We use the SSH_KEY variable provided by withCredentials. 
                     // Quotes around ${SSH_KEY} handle paths with spaces (common on Windows).
                     bat "ssh -o StrictHostKeyChecking=no -i \"${SSH_KEY}\" ${REMOTE_USER}@${REMOTE_HOST} 'sudo rm -rf ${REMOTE_DIR}/*'"
                     
                     // 2. Upload new build (using scp)
                     bat "scp -o StrictHostKeyChecking=no -i \"${SSH_KEY}\" -r dist/* ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"
                }
            }
        }
    }
}
