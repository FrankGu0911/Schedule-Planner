package models

// AIRequest AI识别请求结构
type AIRequest struct {
    Input string `json:"input" binding:"required"`
}

// DifyRequest Dify API请求结构
type DifyRequest struct {
    Inputs        map[string]string `json:"inputs"`
    ResponseMode  string            `json:"response_mode"`
    User          string            `json:"user"`
}

// DifyResponse Dify API响应结构
type DifyResponse struct {
    Query     string                 `json:"query"`
    Response  string                 `json:"response"`
    Status    string                 `json:"status"`
    Data      map[string]interface{} `json:"data"`
} 