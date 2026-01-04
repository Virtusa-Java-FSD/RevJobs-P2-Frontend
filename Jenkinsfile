pipeline {
    agent any

    triggers {
        githubPush()
        pollSCM('H/5 * * * *')
    }

    environment {
        // We read the EC2 IP from a Global Variable named 'EC2_INFRA_IP' which you will set in Jenkins
        REMOTE_HOST = "${env.EC2_INFRA_IP}" 
        REMOTE_USER = "ec2-user"
        REMOTE_DIR = "/home/ec2-user/revjobs/frontend/dist"
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
                    powershell '''
                        $ErrorActionPreference = "Stop"
                        
                        # 1. Fix Key Permissions (Critical for Windows Agents)
                        $keyPath = $env:SSH_KEY
                        $acl = Get-Acl $keyPath
                        $acl.SetAccessRuleProtection($true, $false)
                        $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
                        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($currentUser, "FullControl", "Allow")
                        $acl.SetAccessRule($rule)
                        Set-Acl $keyPath $acl

                        # 2. Deployment
                        $remote = "$env:REMOTE_USER@$env:REMOTE_HOST"
                        $targetDir = $env:REMOTE_DIR
                        
                        Write-Host "Deploying to $remote..."
                        
                        # Use a predictable temp directory structure
                        $tempDir = "frontend_temp_deploy"
                        
                        # Clean and Create temp dir
                        ssh -i $keyPath -o StrictHostKeyChecking=no -o BatchMode=yes -o ConnectTimeout=10 $remote "rm -rf $tempDir && mkdir -p $tempDir"
                        
                        # Upload dist folder INTO tempDir (creates $tempDir/dist)
                        scp -i $keyPath -o StrictHostKeyChecking=no -o BatchMode=yes -o ConnectTimeout=10 -r dist "${remote}:${tempDir}"
                        
                        # Move contents of $tempDir/dist to final $targetDir
                        # We use /dist/* to get the content, ensuring correct structure at target
                        ssh -i $keyPath -o StrictHostKeyChecking=no -o BatchMode=yes -o ConnectTimeout=10 $remote "sudo rm -rf $targetDir/* && sudo cp -r $tempDir/dist/* $targetDir/ && rm -rf $tempDir"
                    '''
                }
            }
        }
    }
}
