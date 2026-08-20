#pragma once

#include <string>

class CImageJpg;

class ClassFlowUploadAPI
{
public:
    bool upload(
        const std::string& sequenceName,
        double actualValue,
        const std::string& status,
        const std::string& timestamp,
        CImageJpg* image
    );

private:
    bool uploadMultipart(
        const std::string& json,
        CImageJpg* image
    );
};