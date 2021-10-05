# comments-api-server

## Description

> This server is intended for informational purposes only, you do not need to use it in production, since it is not protected from hacking in any way and may contain errors.

## Install & run

For a local demonstration, you need to run 2 servers, the server from which you will receive data, and the server that will display the page

#### Server Back-End

##### Download repository
```bash
git clone https://github.com/EvgeniySaschenko/comments-api-server.git
```

##### Install dependencies
```bash
npm install
```

##### Run server
```bash
npm run dev
```

The server will be available at: http://localhost:8888/

#### Server Front-End

##### Download repository
```bash
git clone https://github.com/EvgeniySaschenko/vue-comments.git
```

##### Install dependencies
```bash
npm install
```

##### Run server
```bash
npm run dev
```

The server will be available at: http://localhost:8080/


## Example response

Backend transfers 2 objects:<br>
`items` - list of comments.<br>
`mapItems` - describes the hierarchy of the comment tree.<br>
In these objects from comments are keys.

#### items
```js
  {
    1549: {
      dateCreate: 1632329876,
      dateUpdate: 1632329889,
      dislike: 0,
      like: 0,
      voteValue: 0,
      files: [],
      id: 1549,
      isManageDelete: false,
      isManageEdit: false,
      parentId: 0,
      text: "text 😇😇😇😇",
      userImg: "http://localhost:8888/images/users/6.jpg",
      userName: "Jhon",
    },
    1550: {
      dateCreate: 1632329876,
      dateUpdate: 1632329889,
      dislike: 2,
      like: 0,
      voteValue: -1,
      files: [
        {
          name: "image 1",
          src: "http://localhost:8888/images/comments/1581_0.jpg",
          preview: "http://localhost:8888/images/comments/preview/1581_0.jpg",
        },
      ],
      id: 1550,
      isManageDelete: false,
      isManageEdit: false,
      parentId: 1549,
      text: "text text",
      userImg: "",
      userName: "Ivan",
    },
  }
```

| Parameter | Type | Value | Description |
| --- | :---: | --- | --- |
| dateCreate | `Number` | timestamp | Date of creation |
| dateUpdate | `Number` | 0 / timestamp | Date of editing |
| dislike | `Number` | <= 0 | Number of dislikes |
| like | `Number` | <= 0 | Number of likes |
| voteValue | `Number` | 0 - **did not vote**, <br> 1 - **like**, <br> -1 - **dislike** | The current user has liked, disliked or did not vote |
| files | `Array` | [] - **no files**,<br> [{ name: "Name 1", src: "file link 1", preview: "preview link 1" }, { name: "Name 2", src: "file link 2", preview: "preview link 2" }] - **there are files** | list of files |
| id | `Number` / `String` | Number / String | Unique comment identifier |
| isManageDelete | `Boolean` | true / false | Indicates that the current user has the right to delete the comment|
| isManageEdit | `Boolean` | true / false | Indicates that the current user has the right to edit the comment |
| parentId | `Number` / `String` | Number / String | Ancestor id (id of the comment responded to). **To control the nesting depth of the tree, the server can specify the identifier of another comment** |
| text | `String` | String | Comment text |
| userImg | `String` | String | Comment author's image |
| userName | `String` | String | Comment author name |


#### mapItems
```js
  {
    0: { items: [1549], quantity: 1 },
    1549: { items: [1550], quantity: 1 },
    1550: { items: [], quantity: 0 },
  }
```

**0:** - it describes the first level of comments.

| Parameter | Type | Value | Description |
| --- | :---: | --- | --- |
| items | `Array` | [] | This field contains the ID of comments that are direct descendants, only those IDs whose comments are passed in this request to the client are indicated here. Comments will be displayed in the same order as specified in the array. |
| quantity | `Number` | Number | The total number of comments for this ancestor. |

## Url

| Url | Type query | Description |
| --- | :---: | --- |
| `/api/comments/?parentId=0&createUser=1` | GET | Get list comments. |
| `/api/comments/?parentId=0&firstId=1813&lastId=1793&insertTo=after&newCommentsIds=1811,1812` | GET | Get a list of comments, by clicking on the button "show more" |
| `/api/comments/` | POST | Add comment |
| `/api/comments/` | PUT | Edit comment |
| `/api/comments/` | DELETE | Delete comment |
| `/api/comments/vote/` | POST | Add like / dislike |


**Query params**<br>
`createUser` - the parameter indicates that the server should automatically create a user (this may be needed for the test, when you do not have a registration form) <br>
`parentId` - ancestor id for which we need to get a list of comments <br>
`firstId` - ID of the first comment in the list <br>
`lastId` - ID of the last comment in the list <br>
`insertTo` - **after** / **before** indicates that the comment will be inserted comments (beginning or end of the list) <br>
`newCommentsIds` - this ancestor's comments added by the current user <br>
