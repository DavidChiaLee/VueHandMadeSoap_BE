import { Client } from "https://deno.land/x/mysql@v2.11.0/mod.ts";
import { create, verify, decode, getNumericDate } from "https://deno.land/x/djwt@v2.7/mod.ts";
import { config } from "https://deno.land/std@0.155.0/dotenv/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.0/mod.ts";
import { key } from "./apiKey.ts";

export const resolvers = {
    Query: {
        hello: () => `Hello World!`,
        allUsers: () => allUsers(),
        getUserId: (_: any, args: any) => getUserId(args)
    },   
    Mutation: {
        insertUser: (_: any, args: any) => insertUser(args),
        updateUser: (_: any, args: any) => updateUser(args),
        deleteUser: (_: any, args: any) => deleteUser(args),
        authUser: (_: any, args: any) => authUser(args),
        checkJWT: (_: any, args: any) => checkJWT(args),
    }
};

const configData = await config({
    export: true,
    allowEmptyValues: true,
});

Deno.env.set("USERNAME", "root");

const client = await new Client().connect({
    hostname: Deno.env.get("HOSTNAME"),
    username: Deno.env.get("USERNAME"),
    db: Deno.env.get("DB"),
    password: Deno.env.get("DB_PASSWORD"),
    port: Number(Deno.env.get("PORT"))
});
  
  // 回傳 users 資料表中的所有資料
async function allUsers(){
    return await client.query(`select * from users`);
}

// 新增資料
async function insertUser(args: { nickname: any; email: any;  password: string;}){
    // 加密
    const salt = await bcrypt.genSalt(8);
    const password_hash = await bcrypt.hash(args.password, salt);
    
    let result = await client.execute(`INSERT INTO users(role_id, nickname, email, password) values(2, '${args.nickname}', '${args.email}', '${password_hash}')`);
    let getInsertedUser = await client.query("select * from ?? where id = ?", ["users", result.lastInsertId]);
    return getInsertedUser[0];
}
  
// 更新資料
async function updateUser(args: { id: any; nickname: any;  email: any; }){
    let result = await client.execute(`UPDATE users SET nickname = '${args.nickname}' WHERE id = ${args.id} and email = '${args.email}'`);
    let getUser = await client.query("select * from ?? where id = ? and email =?", ["users", args.id , args.email]);
    return getUser[0];
}
  
// 刪除資料
async function deleteUser(args: { id: any; }){
    let result = await client.execute(`DELETE FROM users where ?? = ?`, ["id", args.id]);
    return (result.affectedRows === 1 ? true : false);
}

//解析 authUser
async function authUser(args: { username: string; password: string; }){
    let user_data = await getUser(args.username);
    //console.log(user_data[0].password);
    if(user_data.length > 0){
      // 解密
      const pwd_result = await bcrypt.compare(args.password, user_data[0].password);
      if(pwd_result){ // 密碼核對通過，回傳 JWT
        // 產生 jwt
        let jwt = await create({ alg: "HS256", typ: "JWT" }, {
          id: user_data[0].id,
          nickname: user_data[0].nickname,
          exp: getNumericDate(60 * 60)}, key
        );
        return jwt;
      }
    }
    return "false";
  }

async function getUser(email: string){
    return await client.query("SELECT * FROM users WHERE email = '" + email + "'");
}

async function checkJWT(args: { jwt: string; }){
    const payload = await verify(args.jwt, key);
    if(payload){
        return true;
    }
    return false;
}

//取得user id，更新要用
async function getUserId(args: {email: any;}){
    let getUserId = await client.query("select id from ?? where email =?", ["users" , args.email]); 
    if(getUserId){
        return getUserId[0];
    }else{
        return false;
    }

}