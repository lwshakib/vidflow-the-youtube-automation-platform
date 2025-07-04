import React from 'react';
import {Composition} from 'remotion';
import {MyComposition} from './Composition';
import RemotionComposition from '../app/(main)/_components/remotion-composition';
 

const videoData = {
  images: ["https://pictures-storage.storage.eu-north1.nebius.cloud/text2img-4d40bab3-47a2-4386-a2ce-8b40ec13a952_00001_.png","https://pictures-storage.storage.eu-north1.nebius.cloud/text2img-3b076529-9779-4085-bcc0-76dae2ec5466_00001_.png","https://pictures-storage.storage.eu-north1.nebius.cloud/text2img-744e13ca-9f50-4ced-a971-25ae62e159d8_00001_.png","https://pictures-storage.storage.eu-north1.nebius.cloud/text2img-90a714f3-f5b6-4860-afad-d7313e0ab64d_00001_.png"],
  captions: [{"end":0.32,"word":"see","start":0,"confidence":0.97778076,"punctuated_word":"See"},{"end":0.56,"word":"a","start":0.32,"confidence":0.9214363,"punctuated_word":"a"},{"end":1.2,"word":"problem","start":0.56,"confidence":0.98077446,"punctuated_word":"problem?"},{"end":1.5999999,"word":"that's","start":1.28,"confidence":0.99278754,"punctuated_word":"That's"},{"end":1.76,"word":"your","start":1.5999999,"confidence":0.99759966,"punctuated_word":"your"},{"end":2.6399999,"word":"opportunity","start":1.76,"confidence":0.8970517,"punctuated_word":"opportunity."},{"end":3.76,"word":"entrepreneurship","start":2.8799999,"confidence":0.99917233,"punctuated_word":"Entrepreneurship"},{"end":3.9199998,"word":"is","start":3.76,"confidence":0.9987204,"punctuated_word":"is"},{"end":4.16,"word":"about","start":3.9199998,"confidence":0.99988043,"punctuated_word":"about"},{"end":4.56,"word":"solving","start":4.16,"confidence":0.99878424,"punctuated_word":"solving"},{"end":4.96,"word":"problems","start":4.56,"confidence":0.99912745,"punctuated_word":"problems"},{"end":5.52,"word":"creatively","start":4.96,"confidence":0.9978232,"punctuated_word":"creatively"},{"end":5.8399997,"word":"and","start":5.52,"confidence":0.99904007,"punctuated_word":"and"},{"end":6.3199997,"word":"efficiently","start":5.8399997,"confidence":0.9927756,"punctuated_word":"efficiently."},{"end":7.3709373,"word":"identify","start":6.8109374,"confidence":0.9990857,"punctuated_word":"Identify"},{"end":7.6109376,"word":"your","start":7.3709373,"confidence":0.9997602,"punctuated_word":"your"},{"end":8.010938,"word":"target","start":7.6109376,"confidence":0.99935085,"punctuated_word":"target"},{"end":8.650938,"word":"market","start":8.010938,"confidence":0.99013317,"punctuated_word":"market,"},{"end":8.890938,"word":"craft","start":8.650938,"confidence":0.99775,"punctuated_word":"craft"},{"end":9.130938,"word":"a","start":8.890938,"confidence":0.9925384,"punctuated_word":"a"},{"end":9.450937,"word":"compelling","start":9.130938,"confidence":0.9999863,"punctuated_word":"compelling"},{"end":9.850937,"word":"value","start":9.450937,"confidence":0.99988556,"punctuated_word":"value"},{"end":10.730937,"word":"proposition","start":9.850937,"confidence":0.91616154,"punctuated_word":"proposition,"},{"end":10.810938,"word":"and","start":10.730938,"confidence":0.99982834,"punctuated_word":"and"},{"end":11.050938,"word":"build","start":10.810938,"confidence":0.9995628,"punctuated_word":"build"},{"end":11.2109375,"word":"a","start":11.050938,"confidence":0.99991035,"punctuated_word":"a"},{"end":11.770937,"word":"sustainable","start":11.2109375,"confidence":0.9998865,"punctuated_word":"sustainable"},{"end":12.090938,"word":"business","start":11.770937,"confidence":0.9998387,"punctuated_word":"business"},{"end":12.810937,"word":"model","start":12.090938,"confidence":0.99732697,"punctuated_word":"model."},{"end":13.690937,"word":"remember","start":12.970938,"confidence":0.9707047,"punctuated_word":"Remember,"},{"end":14.010937,"word":"passion","start":13.690937,"confidence":0.99543446,"punctuated_word":"passion"},{"end":14.250937,"word":"and","start":14.010937,"confidence":0.99966526,"punctuated_word":"and"},{"end":14.810938,"word":"perseverance","start":14.250937,"confidence":0.99996537,"punctuated_word":"perseverance"},{"end":14.970938,"word":"are","start":14.810938,"confidence":0.9995053,"punctuated_word":"are"},{"end":15.130938,"word":"key","start":14.970938,"confidence":0.9997454,"punctuated_word":"key"},{"end":15.610937,"word":"ingredients","start":15.130938,"confidence":0.99980384,"punctuated_word":"ingredients"},{"end":15.850937,"word":"for","start":15.610937,"confidence":0.9997693,"punctuated_word":"for"},{"end":16.250937,"word":"success","start":15.850937,"confidence":0.9806657,"punctuated_word":"success."}],
  audioUrl: "https://vidflow2025.s3.ap-south-1.amazonaws.com/audio/2025-07-03T02-06-03-016Z.mp3"
}


export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="vidflow"
        component={RemotionComposition}
        durationInFrames={60}
        fps={30}
        width={720}        
        height={1280}  
        defaultProps={{
          videoData: videoData
        }}
      />
    </>
  );
};

