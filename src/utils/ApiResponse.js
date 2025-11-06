class ApiResponse {
   constructor(statusCode,data,message = "Success"){
    this.statusCOde = statusCOde
    this.data = data
    this.message = message
    this.success = statusCOde < 400
   }
}

export {ApiResponse}