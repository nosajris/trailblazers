<script lang="ts">
    import Navbar from '$lib/components/navbar.svelte';
    import Footer from '$lib/components/footer.svelte';
    
    let { data } = $props();
    let { event } = data;

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit' 
        }).format(new Date(date));
    };

    const formatPrice = (cents: number) => {
        if (cents === 0) return 'Free';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
    };
</script>

<Navbar />

<main class="bg-brand-light min-h-screen pb-24">
    <!-- Hero Image -->
    <div class="relative h-[50vh] w-full bg-brand-dark">
        <img 
            src={event.imageUrl || '/assets/placeholder.jpg'} 
            alt={event.title} 
            class="w-full h-full object-cover opacity-70"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-brand-light to-transparent"></div>
        
        <div class="absolute bottom-0 left-0 w-full p-6 md:p-12 container mx-auto max-w-5xl">
            <span class="bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                {event.type}
            </span>
            <h1 class="font-serif font-bold text-4xl md:text-6xl text-brand-dark mb-2">{event.title}</h1>
        </div>
    </div>

    <div class="container mx-auto px-6 max-w-5xl -mt-8 relative z-10">
        <div class="grid md:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="md:col-span-2 space-y-8">
                <div class="bg-white p-8 rounded-lg shadow-sm">
                    <h2 class="font-bold text-2xl mb-4 font-serif">About This Event</h2>
                    <p class="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                        {event.description}
                    </p>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <div class="bg-white p-6 rounded-lg shadow-lg border-t-4 border-brand-primary">
                    <h3 class="font-bold text-xl mb-6">Event Details</h3>
                    
                    <div class="space-y-4">
                        <div class="flex items-start gap-3">
                            <div class="bg-brand-light p-2 rounded text-brand-primary">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500 font-bold uppercase">Date & Time</p>
                                <p class="font-medium">{formatDate(event.date)}</p>
                            </div>
                        </div>

                        <div class="flex items-start gap-3">
                            <div class="bg-brand-light p-2 rounded text-brand-primary">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500 font-bold uppercase">Location</p>
                                <p class="font-medium">{event.location}</p>
                            </div>
                        </div>

                        <div class="flex items-start gap-3">
                            <div class="bg-brand-light p-2 rounded text-brand-primary">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500 font-bold uppercase">Cost</p>
                                <p class="font-medium">{formatPrice(event.price || 0)}</p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-8">
                        <button class="w-full btn btn-primary">Register Now</button>
                        {#if event.capacity}
                            <p class="text-center text-xs text-gray-500 mt-2">
                                {event.capacity - (event.registeredCount || 0)} spots remaining
                            </p>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<Footer />