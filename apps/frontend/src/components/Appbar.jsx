export const Appbar = () => {
    return <div className="shadow h-14 flex justify-between items-center">
        <div className="flex  flex-col justify-center h-full ml-4">
            <img src="/paytm.jpg" alt="logo" height={60} width={80}/>
        </div>
        <div className="flex pr-8 items-center">
            <div className="flex flex-col justify-center h-full mr-4 ">
                Hello
            </div>
            <div className=" flex justify-center items-center border-2 h-10 w-10 bg-[#424242] rounded-full">
               <button><img src="/user.svg" alt="userLogo" /></button>     
            </div>
        </div>
    </div>
}