FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY transactionService.jar app.jar
EXPOSE 8003 9003
ENTRYPOINT ["java", "-jar", "app.jar"]