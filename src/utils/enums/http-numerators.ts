export enum HttpContentTypeEnum {
    X_WWW_FORM_URLENCODED = "application/x-www-form-urlencoded",
    APPLICATION_JSON = "application/json"
}

export enum HttpHeadersEnum {
    LOCATION = "Location",
    AUTHORIZATION = "Authorization"
}

export enum HttpStatusCodeEnum {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_ACCEPTABLE = 406,
    INTERNAL_SERVER_ERROR = 500,

}

export enum HttpStatusDescriptionEnum {
    OK = 'Ok',
    CREATED = "Created",
    BAD_REQUEST = "Bad Request",
    UNAUTHORIZED = "Unauthorized",
    FORBIDDEN = "Forbidden",
    NOT_ACCEPTABLE = "Not acceptable",
    INTERNAL_SERVER_ERROR = "Internal Server Error"
}

export enum HttpMethodsEnum {
    POST = "POST",
    GET = "GET",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH"
}