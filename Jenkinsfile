pipeline {
    agent any
        stages {
        stage('Checkout'){
            steps{
                cleanWs()
                sh 'rm -rf *'
                checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: 'githubtoken', url: 'https://github.com/tekdi/kahani-backend.git']])
                //checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: 'prasad-jenkins-github', url: 'https://github.com/haqdarshak/customer-app-backend.git']])
              
          }
        }
        
        stage ('Build-image') {
            steps {  
                      sh 'docker build -t kahani-backend .' 
                   }
            }
       
       stage ('Deploy') {
            steps {
        
               
                      sh 'docker-compose up -d --force-recreate --no-deps backend' 
                   }
            }
       }
}
