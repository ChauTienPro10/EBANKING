FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY ekycService.jar app.jar
EXPOSE 8008 9008
ENTRYPOINT ["java", "-jar", "app.jar"]