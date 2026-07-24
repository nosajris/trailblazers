<script lang="ts">
    let { groups } = $props();
    let filter = $state('all');
    
    let filteredGroups = $derived(
        filter === 'all' ? groups : groups.filter(g => g.type === filter)
    );

    const filters = [
        { id: 'all', label: 'All Groups' },
        { id: 'campus', label: 'Campus' },
        { id: 'pro', label: 'Professionals' },
        { id: 'interest', label: 'Interest-Based' },
        { id: 'online', label: 'Online' }
    ];
</script>

<section id="connect" class="py-24 bg-white">
    <div class="container mx-auto px-6 max-w-7xl">
        <div class="text-center mb-16">
            <h2 class="text-base font-semibold leading-7 text-brand-primary">GET CONNECTED</h2>
            <p class="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl font-serif">Life is Better Together</p>
            <p class="mt-6 mx-auto max-w-2xl text-lg leading-8 text-gray-600">Find your community, build real friendships, and grow in your faith.</p>
        </div>

        <!-- Filter Buttons -->
        <div class="flex justify-center flex-wrap gap-2 mb-8">
            {#each filters as f}
                <button 
                    onclick={() => filter = f.id}
                    class="btn !py-2 !px-5 rounded-full font-semibold {filter === f.id ? 'bg-brand-primary text-white' : 'bg-white text-brand-dark border border-gray-200'}">
                    {f.label}
                </button>
            {/each}
        </div>

        <!-- Groups Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {#each filteredGroups as group (group.id)}
                <div class="card bg-brand-light rounded-lg shadow-lg overflow-hidden">
                    <img src={group.imageUrl} alt={group.name} class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="font-serif font-bold text-xl">{group.name}</h3>
                        <p class="text-gray-600 mt-2 text-sm">Leader(s): {group.leader}</p>
                        <p class="text-gray-600 text-sm">{group.dayTime}</p>
                        <a href="/contact" class="inline-block mt-4 text-brand-primary font-bold hover:underline">Request to Join →</a>
                    </div>
                </div>
            {/each}
        </div>

        <!-- Discord & Spotlight -->
        <div class="mt-12 bg-white rounded-lg shadow-xl p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center border border-gray-100">
            <div>
                <h3 class="font-serif font-bold text-3xl">Join the Conversation</h3>
                <p class="mt-4 text-lg text-gray-600">Our Discord server is the place for real-time connection, prayer requests, and just hanging out.</p>
                <a href="connect" class="mt-6 inline-block btn btn-primary">Join our Discord</a>
            </div>
            <div class="bg-brand-light p-6 rounded-md border-l-4 border-brand-primary">
                 <p class="text-sm font-bold text-brand-primary tracking-widest uppercase">COMMUNITY SPOTLIGHT</p>
                 <blockquote class="mt-2 text-lg italic text-gray-700">"I was so nervous to share my story, but the support I received was overwhelming. This community is the real deal."</blockquote>
                 <cite class="mt-4 block font-bold not-italic">- Jessica P.</cite>
            </div>
        </div>
    </div>
</section>