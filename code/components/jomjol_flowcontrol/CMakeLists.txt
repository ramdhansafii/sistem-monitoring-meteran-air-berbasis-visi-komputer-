file(GLOB SRC "*.cpp")

idf_component_register(
    SRCS ${SRC}
    INCLUDE_DIRS .
    REQUIRES
        image_handling
        display
        camera_ctrl
)