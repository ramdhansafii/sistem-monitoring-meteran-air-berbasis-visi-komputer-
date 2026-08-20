
idf_component_register(
    SRCS
        "display.cpp"
        "displayManager.cpp"
    INCLUDE_DIRS "."
    REQUIRES
        driver
        esp-ssd1306
        esp_driver_spi
        esp_driver_i2c
        esp_driver_gpio
)