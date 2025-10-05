FROM openjdk:17-jdk-slim
WORKDIR /app
COPY authService.jar app.jar
EXPOSE 8000 9000
ENTRYPOINT ["java", "-jar", "app.jar"]