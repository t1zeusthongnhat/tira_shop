# Sử dụng hình ảnh JDK 17 (hoặc phiên bản bạn sử dụng)
FROM eclipse-temurin:17-jdk AS builder

# Đặt thư mục làm việc
WORKDIR /app

# Copy tất cả file từ dự án vào container
COPY . .

# Build ứng dụng bằng Maven
RUN ./mvnw package -DskipTests

# Tạo image mới chỉ chứa JRE và file JAR
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Chạy ứng dụng Spring Boot
CMD ["java", "-jar", "app.jar"]
