FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY socket.jar app.jar
EXPOSE 8006 9006
ENTRYPOINT ["java", "-jar", "app.jar"]