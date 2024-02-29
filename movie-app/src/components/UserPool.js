import {CognitoUserPool} from "amazon-cognito-identity-js";

//AWS Cognito user pool credentials
const poolData = {
    UserPoolId: "us-east-1_pY8ISWhqP",
    ClientId: "37b3sdluv8icngnf7d38e17e7f"
}

export default new CognitoUserPool(poolData);