FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY firebaseService.jar app.jar
EXPOSE 8004 9004
ENTRYPOINT ["java", "-jar", "app.jar"]