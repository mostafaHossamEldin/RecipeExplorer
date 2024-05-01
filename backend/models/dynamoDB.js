const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3")
const AWS = require('aws-sdk');

const eks = require('../eks.json');

const usersTable = eks.USER_TABLE;
const recipesTable = eks.RECIPE_TABLE;
const region = eks.AWS_REGION
const accessKeyId = eks.AWS_ACCESS_KEY_ID
const secretAccessKey = eks.AWS_SECRET_ACCESS_KEY

const dynamoDB = new AWS.DynamoDB({
    region: region,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  });

module.exports = {
    createUserDB: async ( userName, email, salt, hashedPassword) => {
        const existingUser = await getUserByName(userName);
        if (existingUser) {
            return Promise.reject("User Name taken!");
        }
        const params = {
            TableName: usersTable,
            Item: {
                "userID": { N: Math.floor(Math.random() * 1000000000).toString() },
                "userName": { S: userName },
                "email": { S: email },
                "salt": { S: salt },
                "hashedPassword": { S: hashedPassword }
            }
        };
        return dynamoDB.putItem(params).promise();
    },

    getUserByNameDB: async ( userName ) => {
        const params = {
            TableName: usersTable,
            Key: {
                "email": { S: email }
            }
        };
        return dynamoDB.getItem(params).promise();
    },

    getUserByIdDB: async ( userID ) => {
        const params = {
            TableName: usersTable,
            Key: {
                "userID": { N: userID.toString() }
            }
        };
        return dynamoDB.getItem(params).promise();
    },

    createRecipeDB: async ( userID, userName, title, description, ingredients, category, imageName) => {
        const res = await dynamoDB.putItem({
            TableName: recipesTable,
            Item: {
                "recipeID": { N: Math.floor(Math.random() * 1000000000).toString() },
                "userID": { N: userID.toString() },
                "userName": { S: userName },
                "title": { S: title },
                "description": { S: description },
                "ingredients": { S: ingredients },
                "category": { S: category },
                "image": { S: imageName },
                "upvotes": { N: "0" },
            }}).promise();
        return res;
    },

    getAllRecipesDB: async () => {
        const res = await dynamoDB.scan({
            TableName: recipesTable
        }).promise();
        return res;
    },

    getRecipeByIdDB( recipeID ) {
        const params = {
            TableName: recipesTable,
            Key: {
                "recipeID": { N: recipeID.toString() }
            }
        };
        return dynamoDB.getItem(params).promise();
    },

    getRecipesByUserDB( userID ) {
        const params = {
            TableName: recipesTable,
            KeyConditionExpression: "userID = :userID",
            ExpressionAttributeValues: {
                ":userID": { N: userID.toString() }
            }
        };
        return dynamoDB.query(params).promise();
    },

    deleteUserRecipeDB( userID, recipeID ) {
        const params = {
            TableName: recipesTable,
            Key: {
                "userID": { N: userID.toString() },
                "recipeID": { N: recipeID.toString() }
            }
        };
        return dynamoDB.deleteItem(params).promise();
    }
}