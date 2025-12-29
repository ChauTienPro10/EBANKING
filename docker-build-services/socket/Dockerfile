FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY socket.jar app.jar
EXPOSE 8006
ENTRYPOINT ["java", "-jar", "app.jar"]