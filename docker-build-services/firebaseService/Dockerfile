FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY firebaseService.jar app.jar
EXPOSE 8004 9004
ENTRYPOINT ["java", "-jar", "app.jar"]