#pragma once

#include <string>

extern "C" {
#include "ssd1306.h"
}

class Display
{
public:
    bool init();

    void clear();

    void print(
        int line,
        const std::string& text
    );

    void update();

    void showBoot();

    void showProgress(const std::string& title);

    void showReading(
        const std::string& value
    );

    void power(const bool);

private:
    bool initialized = false;

    ssd1306_handle_t display = nullptr;
};