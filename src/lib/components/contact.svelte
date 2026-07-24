<script lang="ts">
    import { enhance } from '$app/forms';
    
    let status = $state('');
    let statusClass = $state('');
    let loading = $state(false);
</script>

<section id="contact" class="py-24 bg-brand-light">
    <div class="container mx-auto px-6 max-w-7xl">
        <div class="text-center mb-16">
            <h2 class="font-serif text-4xl md:text-5xl font-bold">Get in Touch</h2>
            <p class="mt-4 text-lg text-gray-600">We'd love to hear from you. Connect with us to learn more or to get involved.</p>
        </div>
        <div class="grid md:grid-cols-2 gap-12">
             <!-- Contact Info Column -->
             <div class="space-y-6 md:pt-8">
                 <div class="flex items-center gap-4">
                     <div class="flex-shrink-0 w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-lg flex items-center justify-center">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                     </div>
                     <div>
                         <h4 class="font-bold">Our Location</h4>
                         <p class="text-gray-600">123 Catalyst Avenue, Harare, Zimbabwe</p>
                     </div>
                 </div>
                 <div class="flex items-center gap-4">
                     <div class="flex-shrink-0 w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-lg flex items-center justify-center">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                     </div>
                     <div>
                         <h4 class="font-bold">Email Us</h4>
                         <p class="text-gray-600">connect@paoztrailblazers.org</p>
                     </div>
                 </div>
             </div>

             <!-- Form Column -->
             <div class="bg-white p-8 rounded-lg shadow-xl">
                 <h3 class="font-serif text-2xl font-bold mb-6">Send us a Message</h3>
                 
                 <!-- Pointing to the contact route for the action -->
                 <form 
                    method="POST" 
                    action="/contact" 
                    use:enhance={() => {
                        loading = true;
                        status = 'Sending...';
                        statusClass = 'text-gray-600';
                        
                        return async ({ result, update }) => {
                            loading = false;
                            if (result.type === 'success') {
                                status = 'Thank you! Your message has been sent.';
                                statusClass = 'text-green-600 font-bold';
                                await update();
                            } else {
                                status = 'Something went wrong. Please try again.';
                                statusClass = 'text-red-600 font-bold';
                            }
                        };
                    }}
                    class="space-y-6"
                >
                     <div>
                         <label for="name" class="sr-only">Name</label>
                         <input type="text" name="name" id="name" placeholder="Your Name" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary p-3 border" required>
                     </div>
                     <div>
                         <label for="email" class="sr-only">Email</label>
                         <input type="email" name="email" id="email" placeholder="Your Email" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary p-3 border" required>
                     </div>
                     <div>
                         <label for="message" class="sr-only">Message</label>
                         <textarea name="message" id="message" rows="4" placeholder="Your Message" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary p-3 border" required></textarea>
                     </div>
                     <div>
                         <button type="submit" disabled={loading} class="w-full flex justify-center btn btn-primary disabled:opacity-50">
                             {loading ? 'Sending...' : 'Send Message'}
                         </button>
                     </div>
                     {#if status}
                        <p class="text-sm mt-4 text-center {statusClass}">{status}</p>
                     {/if}
                 </form>
             </div>
        </div>
    </div>
</section>