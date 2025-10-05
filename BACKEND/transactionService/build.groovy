def buildModule() {
    echo "Bắt đầu build module transactionService: ${pwd()}"

    // Cài đặt Maven nếu chưa có sẵn
    // Nếu đã có trong Docker image hoặc Jenkins agent thì bỏ qua bước này
    sh 'mvn --version'

    // Clean & Build
    sh 'mvn clean install -DskipTests=true'
    // sh 'mvn package'

    echo "Build hoàn tất cho module Java: ${pwd()}"
}

return this
