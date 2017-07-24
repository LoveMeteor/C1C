import { Tags } from '/imports/api/tags/tags'


export function xor(array,value,dcopy = false){
    if(array.find((item)=> value === item)){
      array.pop(value);
    }
    else {
      array.push(value);
    }

    if(dcopy){
      return array.concat([])
    }
    return array
}

// Maybe move this on the tags api as a generic helper for tags
export function getTagsFromString(string){
  return Tags.find({ name : {$regex: string, $options: 'ig' }}).map((tag) => {return tag._id})
}