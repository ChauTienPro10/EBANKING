FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY chatbotService.jar app.jar
EXPOSE 8007 9007
ENTRYPOINT ["java", "-jar", "app.jar"]