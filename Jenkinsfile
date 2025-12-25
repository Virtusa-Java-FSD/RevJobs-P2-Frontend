pipeline {
    agent any

    environment {
        // We read the EC2 IP from a Global Variable named 'EC2_INFRA_IP' which you will set in Jenkins
        REMOTE_HOST = "${env.EC2_INFRA_IP}" 
        REMOTE_USER = "ec2-user"
        REMOTE_DIR = "/usr/share/nginx/html"
        SSH_CREDENTIALS_ID = "ec2-ssh-key" // You must create this ID in Jenkins Credentials
    }

    tools {
        nodejs 'NodeJS 18' // Ensure this matches your Global Tool Configuration in Jenkins
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
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
                sshagent(['ec2-ssh-key']) {
                     // 1. Clear old files
                     bat "ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_HOST} 'sudo rm -rf ${REMOTE_DIR}/*'"
                     
                     // 2. Upload new build (using scp) - converting Windows path to Linux style for scp might be tricky, 
                     // so we enter the dist folder and copy contents.
                     // Note: Jenkins on Windows running 'scp' might behave differently. 
                     // We assume 'scp' is available in the path (e.g. Git Bash).
                     
                     bat "scp -o StrictHostKeyChecking=no -r dist/* ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"
                }
            }
        }
    }
}
