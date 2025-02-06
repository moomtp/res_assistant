pipeline {
    agent any
    
    triggers {
        githubPush()
    }

    environment {
        REPO_PATH = "/home/jenkins/res_assistant"  // 設定存放路徑
    }

    stages {
        stage('Clone Repository') {
            steps {
                script {
                    sh "whoami"
                    sh "rm -rf ${REPO_PATH}" // 確保路徑乾淨
                    sh "git clone -b main https://github.com/moomtp/res_assistant ${REPO_PATH}"
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    echo "Building the project..."
                    sh "docker buildx install && docker buildx create --use"
                    
                    //sh 'docker login --username "$(jq -r .username /home/jenkins/docker_info.json)"" --password-stdin <<< "$(jq -r .password /home/jenkins/docker_info.json)"'
                    sh "cd ${REPO_PATH} && ./build_pipeline.sh"
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    echo "Running tests..."
                    sh "cd ${REPO_PATH} && ./ci_pipeline.sh"
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo "Deploying the application..."
                    sh "cd ${REPO_PATH} && ./cd_pipeline.sh"
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline executed successfully!"
        }
        failure {
            echo "Pipeline failed!"
        }
    }
}
