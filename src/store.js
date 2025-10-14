import { createStore } from "vuex";
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve,ms));
}
//create a new store instance
const store = createStore({
    state(){
        return {
            count: 0
        }
    },
    mutations:{
        increament(state){
            state.count++
        },
        decrease(state){
            state.coun--
        }
    }
})
export default store