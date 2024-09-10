export function interleaveArrays(arr1: any[], arr2: any[]){
    let interleavedArr = [] as any[];
    if(arr2.length === arr1.length){
        arr1.forEach((element: any, index: number) => {
            interleavedArr.push(element);
            interleavedArr.push(arr2[index]);
        })
    } else if (arr2.length === arr1.length - 1){
        arr2.forEach((element: any, index: number) => {
            interleavedArr.push(arr1[index]);
            interleavedArr.push(element);           
        })            
        interleavedArr.push(arr1[arr1.length - 1]);
    } else if(arr2.length === arr1.length + 1){
        arr1.forEach((element: any, index: number) => {
            interleavedArr.push(element); 
            interleavedArr.push(arr2[index]);          
        })         
        interleavedArr.push(arr2[arr2.length - 1])   ;
    } else {
        console.log("Array1 length: " + arr1.length);
        console.log("Array2 length: " + arr2.length);
        throw new Error("Cannot compare arrays if the difference between their lengths is greater than 1");
    }
    return interleavedArr;
}