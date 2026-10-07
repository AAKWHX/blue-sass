// Uses the deployment's OIDC identity; never reads or prints a credential.
if(process.env.VERCEL_ENV==="production"&&process.env.AI_MODEL){
 const {generateText}=await import("ai");
 try{const result=await generateText({model:process.env.AI_MODEL,prompt:"Reply with a short Arabic sentence saying Blue Sass tools are ready.",maxOutputTokens:500,abortSignal:AbortSignal.timeout(35000),maxRetries:0});
 console.log(result.text.trim()?`AI Gateway production smoke test succeeded: ${result.text.trim().slice(0,120)}`:"AI Gateway returned no visible text; inspect its account configuration.");
 }catch(error){const cause=error?.lastError??error?.cause??error;console.log(`AI Gateway production smoke test unavailable (status ${Number(cause?.statusCode)||"unknown"}).`);}
}
