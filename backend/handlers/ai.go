package handlers

import (
    "bytes"
    "encoding/json"
    "github.com/gin-gonic/gin"
    "io/ioutil"
    "net/http"
    "todolist/models"
)

const (
    DifyBaseURL = "https://dify.frankgu.club:8888"
    DifyAPIKey  = "Bearer app-aFzcAUK2Xap71boryALR4Pc5"
)

// ProcessAI 处理AI识别请求
func ProcessAI(c *gin.Context) {
    var request models.AIRequest
    if err := c.ShouldBindJSON(&request); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // 构建发送到Dify的请求
    difyRequest := models.DifyRequest{
        Inputs: map[string]string{
            "input": request.Input,
        },
        ResponseMode: "blocking",
        User:        "frank",
    }

    // 将请求转换为JSON
    jsonData, err := json.Marshal(difyRequest)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "请求处理失败"})
        return
    }

    // 创建HTTP请求
    req, err := http.NewRequest("POST", DifyBaseURL+"/v1/workflows/run", bytes.NewBuffer(jsonData))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "创建请求失败"})
        return
    }

    // 设置请求头
    req.Header.Set("Authorization", DifyAPIKey)
    req.Header.Set("Content-Type", "application/json")

    // 发送请求
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "请求失败"})
        return
    }
    defer resp.Body.Close()

    // 读取响应
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "读取响应失败"})
        return
    }

    // 解析响应
    var difyResponse models.DifyResponse
    if err := json.Unmarshal(body, &difyResponse); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "解析响应失败"})
        return
    }

    // 返回响应
    c.JSON(http.StatusOK, difyResponse)
} 