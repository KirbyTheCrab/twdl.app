import User from "./User.js";
import { createConnection } from "mysql2/promise";
import "reflect-metadata";
import dotenv from 'dotenv'
dotenv.config()

class Database {
  config;
  constructor() {
    this.config = {
      host: process.env.DB_IP,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    };
    this.connection = null;
  }
  /**
   * Connect to database
   */
  async db_connect() {
    try {
      if (!this.connection) {
        this.connection = await createConnection(this.config);
        console.log("Successfully connected to database");
      }
    } catch (error) {
      console.error("Failed to connect database " + error.message);
    }
  }

  /**
   * Reusable database query method
   * @param sql | sql query
   * @returns results from query
   */
  async db_query(sql) {
    try {
      if (!this.connection) {
        await this.db_connect();
      }
      const [results] = await this.connection.execute(sql);
      return results;
    } catch (error) {
      console.error("Unable to execute query" + error.message);
    }
  }

  /**
   * Close database connection
   */
  async close_db_connection() {
    try {
      if (this.connection) {
        await this.connection.end();
        console.log("Database connection closed, bye bye");
        this.connection = null;
      }
    } catch (error) {
      console.error("Unable to close database connection" + error.message);
    }
  }
  /**
   * Turn database getters into displayable text
   * @param {*} response from database after SELECT query
   * @returns displayable text
   */
  async responseToText(response) {
    const resultText = response
      .map((row) => {
        return Object.values(row).join(", ");
      })
      .join("\n");
    return resultText;
  }

  async createUserObject(response) {
    let user;
    response.map((row) => {
      // console.log(row.user_id)
      user = new User(
        row.user_id,
        row.discord_name,
        row.role_count,
        row.is_mod,
        row.discord_server_id,
        row.discord_user_id
      );
    });
    return user;
  }
}

export default Database;
