import { useState , useEffect } from "react"
import { Button } from "./Button"
import axios from "axios";
import { useNavigate } from "react-router";


export const Users = () => {
    const [filtered , setFiltered] = useState('')
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const timeout = setTimeout(async () => {
            const response = await axios.get("http://localhost:3000/api/v1/user/bulk?filter=" + filtered);
            setUsers(response.data.user);
        }, 500);
    
        return () => clearTimeout(timeout);
    }, [filtered]);
    

    return <>
        <div className="font-bold mt-6 text-lg">
            Users
        </div>
        <div className="py-4">
            <input onChange={(e)=>{
                setFiltered(e.target.value)
            }} type="text" placeholder="Search users..." className="w-full px-2 py-2 border rounded border-slate-200"></input>
        </div>
        <div>
            {users.map(user => <User user={user} />)}
        </div>
    </>
}

function User({user}) {
    const navigate = useNavigate()
    return <div className="flex justify-between border p-4 mt-4">
        <div className="flex  ">
            <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
                <div className="flex uppercase flex-col justify-center h-full text-xl">
                    {user.firstName[0]}
                </div>
            </div>
            <div className="flex flex-col justify-center h-ful">
                <div className=" uppercase">
                    {user.firstName} {user.lastName}
                </div>
            </div>
        </div>

        <div className="flex flex-col justify-center h-ful">
            <Button onClick={(e)=>{


                navigate("/send?id=" + user._id + "&name=" + user.firstName)
            }} label={"Send Money"} />
        </div>
    </div>
}