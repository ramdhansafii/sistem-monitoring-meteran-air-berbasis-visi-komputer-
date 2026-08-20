#include "display.h"

#include "displayConfig.h"

#include "driver/i2c_master.h"
#include "esp_log.h"

static const char *TAG = "Display";
static i2c_master_bus_handle_t i2c_bus = nullptr;

static void init_i2c()
{
    i2c_master_bus_config_t bus_cfg = {};

    bus_cfg.i2c_port = I2C_NUM_0;
    bus_cfg.sda_io_num = GPIO_NUM_41;
    bus_cfg.scl_io_num = GPIO_NUM_42;
    bus_cfg.clk_source = I2C_CLK_SRC_DEFAULT;
    bus_cfg.glitch_ignore_cnt = 7;
    bus_cfg.flags.enable_internal_pullup = true;

    ESP_ERROR_CHECK(
        i2c_new_master_bus(
            &bus_cfg,
            &i2c_bus
        )
    );
}
bool Display::init()
{
    init_i2c();

    ssd1306_config_t cfg = {};

    cfg.bus = SSD1306_I2C;
    cfg.width = 128;
    cfg.height = 64;

    cfg.fb = nullptr;
    cfg.fb_len = 0;

    cfg.iface.i2c.port = I2C_NUM_0;
    cfg.iface.i2c.addr = 0x3C;
    cfg.iface.i2c.rst_gpio = GPIO_NUM_NC;

    ESP_ERROR_CHECK(
        ssd1306_new_i2c(
            &cfg,
            &display
        )
    );

    initialized = true;

    clear();

    ESP_LOGI(TAG, "Display initialized");

    return true;
}

void Display::clear()
{
    if (!initialized)
        return;

    ssd1306_clear(display);
    ssd1306_display(display);
}

void Display::print(
    int line,
    const std::string &text)
{
    if (!initialized)
        return;

    int y = line * 16;

    ssd1306_draw_text(
        display,
        0,
        y,
        text.c_str(),
        true
    );

    ssd1306_display(display);
}

void Display::update()
{
    if (!initialized)
        return;

    ssd1306_display(display);
}

void Display::showBoot()
{
    clear();

    print(0, "Water Meter");
    print(2, "Booting...");

    update();
}

void Display::showProgress(const std::string& title)
{
    clear();

    print(0, "Water Meter");
    print(2, title);

    update();
}

void Display::showReading(
    const std::string& value)
{
    clear();

    print(0, "Reading");
    print(2, value);

    update();
}

void Display::power(bool enable)
{
    if (!initialized)
        return;

    ESP_ERROR_CHECK(
        ssd1306_power(display, enable)
    );
}