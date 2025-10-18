FROM openjdk:17-jdk-slim
WORKDIR /app
COPY transactionService.jar app.jar
EXPOSE 8003 9003
ENTRYPOINT ["java", "-jar", "app.jar"]