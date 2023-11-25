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
        method:['GET','POST']
    }
})
//this arr used to store all the users currently in the server
let users=[];
//operations
    //on connecting to the server
       //create a user
          io.on('connection',(socket)=>{
              console.log("New client connected[+] ",socket.id)
            // emit user details every 60 sec
            // Set up a timer to emit a socket event every 5 seconds
            const emitInterval = setInterval(() => {
                // Emit the event to the connected
                console.log("Emitting data[+]") 
                io.emit('userConnected', users);
            }, 10000);
              //new user connection
              socket.on('setNewUser',({id,username,bg})=>{
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
                    console.log("USER ARRAY UPDATED-->",users)
                    io.emit('userConnected', users);
                }
            })
            //remove the user
            socket.on('disconnect',()=>{
                users=users.filter((item)=>item.id!=socket.id)
                console.log("uer disconnected and array updated")
                console.log("user--.",users)
                clearInterval(emitInterval)
                io.emit('userConnected', users);
              })
          })
const PORT=9000;
server.listen(PORT,()=>console.log("Socket Server running on port: ",PORT))