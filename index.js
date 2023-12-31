const express=require('express')
const http=require('http')
const cors=require('cors')
const {Server}=require('socket.io')


const app=express()
app.use(cors())
app.use(express.json())
// creating server 
const server=http.createServer(app);
const io=new Server(server,{
    cors:{
        origin:'*',
        method:['GET','POST'],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
})
//this arr used to store all the users currently in the server
let users=[];
//operations
    //on connecting to the server
       //create a user
          io.on('connection',(socket)=>{
                    //new user connection
                    socket.on('setNewUser',({id,username,bg})=>{
                            console.log("New client connected[+] ",socket.id,"-->",username)
                            const isUserPresent=io.sockets.sockets.get(id);
                            if(isUserPresent)
                            {
                                let isChanged=false;
                                let empArray=[];
                                users.map((single)=>{
                                    if(single.id==id)
                                    {
                                        //update the details of the user in server if present
                                        let newsingle={id:id,username:username,bg:bg}
                                        empArray.push(newsingle)
                                        isChanged=true;
                                    }
                                    else
                                    empArray.push(single)
                                })
                                if(isChanged==false)
                                users.push({id:id,username:username,bg:bg})
                                else 
                                users=empArray
                                //return all the users currently in the server
                                io.emit('userConnected', users);
                            }
                        })
                    //remove the user
                        socket.on('disconnect',()=>{
                            users=users.filter((item)=>item.id!=socket.id)
                            io.emit('userConnected', users);
                        })
                    //create room
                        socket.on("join_room",(id)=>{
                            console.log("Joining into a room id->",id)  
                            socket.join(id)
                        })
                    //send message
                        socket.on('send_message',(data)=>{
                                console.log("[+] sending msg-->",data)
                                socket.to(data.id).emit('receive_message',data)
                        })
                    //liked message
                        socket.on("liked_message",(data)=>{
                                console.log("liked msg-->",data)
                                socket.to(data.id).emit("receive_message",data)
                        })
                    //delete message
                        socket.on("delete_message",(data)=>{
                            console.log("Deleted msg-->",data)
                            socket.to(data.id).emit("receive_deleted_message",data);
                        })
          })
          
const PORT=9000;
server.listen(PORT,()=>console.log("Socket Server running on port: ",PORT))