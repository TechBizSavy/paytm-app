export const Appbar = () => {
    return <div className="shadow h-14 flex justify-between items-center">
        <div className="flex flex-col justify-center h-full ml-4">
            PayTM App
        </div>
        <div className="flex pr-8 items-center">
            <div className="flex flex-col justify-center h-full mr-4 ">
                Hello
            </div>
            {/* <div className="rounded-full h-10 w-10  bg-slate-200 flex justify-center mt-1 mr-2 ">
                <div className="flex flex-col justify-center h-full text-xl ">
                    U
                </div>
            </div> */}
            <div className=" flex justify-center items-center border-2 h-10 w-10 bg-[#424242] rounded-full">
               <button><img src="/user.svg" alt="userLogo" /></button>     
            </div>
        </div>
    </div>
}