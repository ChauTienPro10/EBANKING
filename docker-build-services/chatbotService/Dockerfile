FROM openjdk:17-jdk-slim
WORKDIR /app
COPY chatbotService.jar app.jar
EXPOSE 8002 9002
ENTRYPOINT ["java", "-jar", "app.jar"]