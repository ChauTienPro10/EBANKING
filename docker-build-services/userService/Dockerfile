FROM openjdk:17-jdk-slim
WORKDIR /app
COPY userService.jar app.jar
EXPOSE 8001 9001
ENTRYPOINT ["java", "-jar", "app.jar"]