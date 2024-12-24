package com.tirashop.validator;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Converter(autoApply = true)
public class LocalDateAttributeConverter implements AttributeConverter<LocalDate, String> {

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    public String convertToDatabaseColumn(LocalDate localDate) {
        return localDate != null ? localDate.format(formatter) : null;
    }

    @Override
    public LocalDate convertToEntityAttribute(String dateString) {
        return dateString != null ? LocalDate.parse(dateString, formatter) : null;
    }
}