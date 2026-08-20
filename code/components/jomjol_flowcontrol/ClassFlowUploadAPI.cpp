#include "ClassFlowUploadAPI.h"

#include "CImageJpg.h"

#include "displayManager.h"
#include "ClassControlCamera.h"

#include <esp_http_client.h>
#include <esp_log.h>
#include <cJSON.h>

static const char *TAG = "UploadAPI";

bool ClassFlowUploadAPI::upload(
    const std::string& sequenceName,
    double actualValue,
    const std::string& status,
    const std::string& timestamp,
    CImageJpg* image)
{
    cJSON* root = cJSON_CreateObject();

    cJSON_AddStringToObject(root, "sequence", sequenceName.c_str());
    cJSON_AddNumberToObject(root, "reading", actualValue);
    cJSON_AddStringToObject(root, "status", status.c_str());
    cJSON_AddStringToObject(root, "timestamp", timestamp.c_str());

    char* json = cJSON_PrintUnformatted(root);

    bool ok = uploadMultipart(json, image);

    free(json);
    cJSON_Delete(root);

    display.showProgress("Upload to API Success");

    vTaskDelay(pdMS_TO_TICKS(3000));

    display.power(false);
    // cameraCtrl.deinitCam();
    ESP_LOGI(TAG, "De-init cam");

    return ok;
}

bool ClassFlowUploadAPI::uploadMultipart(
    const std::string& json,
    CImageJpg* image)
{
    const char* boundary = "----ESP32Boundary123456";

    const uint8_t* jpgData = nullptr;
    int jpgSize = 0;

    if (image && image->isValid())
    {
        jpgData = image->getImgData();
        jpgSize = image->getImgDataSize();
    }

    std::string body;

    // JSON part
    body += "--";
    body += boundary;
    body += "\r\n";

    body += "Content-Disposition: form-data; name=\"data\"\r\n";
    body += "Content-Type: application/json\r\n\r\n";

    body += json;
    body += "\r\n";

    // Image part
    if (image)
    {
        body += "--";
        body += boundary;
        body += "\r\n";

        body += "Content-Disposition: form-data; name=\"image\"; filename=\"meter.jpg\"\r\n";
        body += "Content-Type: image/jpeg\r\n\r\n";

        body.append(reinterpret_cast<const char*>(jpgData), jpgSize);

        body += "\r\n";
    }

    // End boundary
    body += "--";
    body += boundary;
    body += "--\r\n";

    esp_http_client_config_t config = {};
    config.url = "http://192.168.43.185/sisfor_restoran_new111/api/meter-reading.php";
    config.method = HTTP_METHOD_POST;

    esp_http_client_handle_t client =
        esp_http_client_init(&config);

    std::string contentType =
        "multipart/form-data; boundary=" +
        std::string(boundary);

    esp_http_client_set_header(
        client,
        "Content-Type",
        contentType.c_str()
    );

    esp_http_client_set_header(
        client,
        "X-Device-ID",
        "0016181234567890"
    );

    esp_http_client_set_header(
        client,
        "X-API-Key",
        "esp32cam-001-aaaa-bbbb-cccc-dddd-eeee"
    );

    esp_http_client_set_post_field(
        client,
        body.data(),
        body.size()
    );

    esp_err_t err =
        esp_http_client_perform(client);

    if (err != ESP_OK)
    {
        ESP_LOGE(TAG,
            "HTTP error: %s",
            esp_err_to_name(err));

        esp_http_client_cleanup(client);
        return false;
    }

    int status =
        esp_http_client_get_status_code(client);

    ESP_LOGI(TAG,
        "Upload status: %d",
        status);

    esp_http_client_cleanup(client);

    return status >= 200 && status < 300;
}