FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY userService.jar app.jar
EXPOSE 8001 9001
ENTRYPOINT ["java", "-jar", "app.jar"]